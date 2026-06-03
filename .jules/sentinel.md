## 2024-05-18 - Configuration Information Exposure in Error Responses
**Vulnerability:** API error responses (e.g., in Vercel functions within `api/`) included debug objects revealing internal configuration status, such as boolean flags indicating the presence of environment variables.
**Learning:** Returning debug information directly to the client in production APIs can expose internal infrastructure details to attackers. Error responses must not include debug objects or metadata.
**Prevention:** API error responses must only return a generic `error` string. Debugging information should be restricted to server-side logs.
