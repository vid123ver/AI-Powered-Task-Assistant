# Writeup
 
## What I learned
I learned how an AI model can actually call functions/tools instead of just
replying with text, and how MCP servers work to connect an AI client (like
Claude Desktop) to my own APIs.
I also learned the difference between an
MCP server and an MCP client — the server exposes tools, the client (like
Claude Desktop) is what connects to it and actually calls those tools.
 
## What confused me
The main problem I faced was understanding Gemini's structure — how the
chat, system instruction, and function declarations all connect together,
and getting the API key and model setup right. I also face problem in
MCP server configuration, especially connecting it properly to Claude
Desktop and making sure the token and URL matched the backend.
 

Adding new features like due date and priority later meant changing code in
almost every layer (tool schema, service, MCP tool, frontend form). Next
time I'd plan the task fields upfront so I don't have to restructure
everything just to add one new field.