## 2026-05-03 - [Insecure Randomness in Identifier Generation]
**Vulnerability:** Predictable identifier generation using `Math.random()` for file uploads (`SupportTicketForm.tsx`) and conversation IDs (`FloatingChat.tsx`).
**Learning:** Using `Math.random()` for security-sensitive identifiers makes them easily predictable, leading to potential ID collisions and data predictability vulnerabilities.
**Prevention:** Always use `crypto.randomUUID()` for generating unique, secure identifiers across the application.
