package com.genai.bi.service;

import org.springframework.beans.factory.annotation.Value;

import okhttp3.*;
import com.google.gson.*;
import org.springframework.stereotype.Service;

@Service
public class LlmService {

    private final SchemaService schemaService;

    private static final String SQL_MODEL = "deepseek/deepseek-chat";
    private static final String INSIGHT_MODEL = "meta-llama/llama-3-8b-instruct";

    @Value("${openrouter.api.key}")
    private String apiKey;
    public LlmService(SchemaService schemaService){
        this.schemaService = schemaService;
    }

    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
            .build();


    // -----------------------------
    // Extract JSON safely from LLM
    // -----------------------------
    private String extractJson(String text) {

        int start = text.indexOf("{");

        if (start == -1) {
            throw new RuntimeException("No JSON found in LLM response: " + text);
        }

        int depth = 0;

        for (int i = start; i < text.length(); i++) {

            char c = text.charAt(i);

            if (c == '{') depth++;
            if (c == '}') depth--;

            if (depth == 0) {
                return text.substring(start, i + 1);
            }
        }

        throw new RuntimeException("Incomplete JSON in LLM response: " + text);
    }


    // -----------------------------
    // Generic LLM caller
    // -----------------------------
    private String callLLM(String model, String prompt) throws Exception {

        JsonObject message = new JsonObject();
        message.addProperty("role","user");
        message.addProperty("content",prompt);

        JsonArray messages = new JsonArray();
        messages.add(message);

        JsonObject body = new JsonObject();
        body.addProperty("model", model);
        body.add("messages",messages);

        Request request = new Request.Builder()
                .url("https://openrouter.ai/api/v1/chat/completions")
                .addHeader("Authorization","Bearer " + apiKey)
                .addHeader("Content-Type","application/json")
                .post(RequestBody.create(
                        body.toString(),
                        MediaType.parse("application/json")
                ))
                .build();

        Response response = client.newCall(request).execute();

        String responseBody = response.body().string();

        System.out.println("Raw LLM Response:\n" + responseBody);

        JsonObject json = JsonParser.parseString(responseBody).getAsJsonObject();

        String content = json.getAsJsonArray("choices")
                .get(0)
                .getAsJsonObject()
                .getAsJsonObject("message")
                .get("content")
                .getAsString();

        return content.trim();
    }


    // -----------------------------
    // STEP 1: Generate SQL
    // -----------------------------
    public String generateSql(String question) throws Exception {

        String schema = schemaService.getDatabaseSchema();

        String prompt = """
You are a PostgreSQL expert specializing in generating SQL queries from natural language.

Database Schema:
%s

Task:
Convert the user question into a valid PostgreSQL SQL query.

Important rules:

1. Use ONLY tables and columns present in the schema.
2. NEVER invent tables or columns.

3. CSV imported tables may store numeric or date values as TEXT.
   When necessary, CAST values properly:
   - Use column::date when extracting YEAR, MONTH, etc.
   - Use column::numeric when performing SUM(), AVG(), etc.

4. When using date functions such as EXTRACT, always cast:
   Example:
   EXTRACT(YEAR FROM date::date)

5. When performing aggregation (SUM, COUNT, AVG):
   - Always include GROUP BY for non aggregated columns.
   - Do NOT rely on column aliases in GROUP BY.
   - Repeat the full expression instead.

6. Only generate SELECT queries.
   Never generate INSERT, UPDATE, DELETE, DROP or ALTER.

7. Avoid advanced PostgreSQL JSON functions such as:
   json_agg, json_build_object, row_to_json.

8. Prefer simple analytical queries that return tabular results.

9. Always return SQL that can run directly in PostgreSQL.

Return ONLY valid JSON in this format:

{
 "sql": "SELECT ..."
}

Do NOT include:
- explanations
- markdown
- comments
- extra text

Example:

User Question:
Total marketing expense by year

Output:

{
 "sql": "SELECT EXTRACT(YEAR FROM date::date) AS year, SUM(marketing_expense::numeric) AS total_marketing_expense FROM small_business_financials GROUP BY EXTRACT(YEAR FROM date::date) ORDER BY year"
}

User Question:
%s
""".formatted(schema, question);

        String response = callLLM(SQL_MODEL, prompt);

        response = extractJson(response);

        JsonObject json = JsonParser.parseString(response).getAsJsonObject();

        return json.get("sql").getAsString();
    }


    // -----------------------------
    // STEP 2: Chart + Insight
    // -----------------------------
    public JsonObject generateChartAndInsight(String question, String dataJson) throws Exception {
        String prompt = """
You are a Business Intelligence assistant that converts SQL query results into visualization metadata.

User Question:
%s

Query Result Data:
%s

Your tasks:

1. Select the best chart type.
2. Select correct xAxis and yAxis from the dataset.
3. Generate three short insights.

Chart type rules:

- line → time trends (year, month, quarter)
- bar → category comparisons
- pie → distribution of values
- scatter → correlation
- table → if chart is not meaningful

Axis rules:

- xAxis MUST be a categorical or time column.
- yAxis MUST be a numeric column.
- Use ONLY column names present in the dataset.
- NEVER invent column names.

Insight rules:

- Exactly 3 insights.
- Each insight must be a short sentence.
- Maximum 12 words per insight.
- Do NOT use commas.
- Do NOT break insights across lines.

Return ONLY valid JSON.

The output MUST follow exactly this structure:

{
 "chartType": "bar",
 "xAxis": "column_name",
 "yAxis": "column_name",
 "insight": [
   "Insight one",
   "Insight two",
   "Insight three"
 ]
}

Important:

- Do NOT include explanations
- Do NOT include markdown
- Do NOT include extra text
- Ensure the JSON is valid and closed

User Question:
%s
""".formatted(question, dataJson, question);

        String response = callLLM(INSIGHT_MODEL, prompt);
        response = response.replace("\n", " ");
        response = response.replaceAll(",\\s*]", "]");
        response = response.replaceAll(",\\s*}", "}");

        response = extractJson(response);

        JsonObject json;

        try {
            json = JsonParser.parseString(response).getAsJsonObject();
        } catch(Exception e) {

            System.out.println("Invalid JSON returned by LLM:");
            System.out.println(response);

            throw new RuntimeException("LLM returned invalid JSON");
        }

        return json;
    }

}