CODE AND DEVELOPMENT RULES:
1. Always prioritize clean, readable, and well-documented code
2. Use descriptive names for variables, functions, and classes
3. Keep functions small with single responsibility
4. Add explanatory comments for complex logic
5. Implement proper error handling with try-catch blocks
6. Validate user inputs before processing
7. Use constants for magic numbers and configurations
8. Prefer composition over inheritance when possible
9. Apply SOLID principles in code design
10. Avoid code duplication (DRY - Don't Repeat Yourself)

SECURITY:
11. Never include credentials, API keys, or passwords in code
12. Use environment variables for sensitive configurations
13. Validate and sanitize all user inputs
14. Implement proper authentication and authorization
15. Use HTTPS for all network communications
16. Prevent SQL injection using prepared statements
17. Implement rate limiting on APIs
18. Use secure hashing for passwords (bcrypt, scrypt)
19. Keep dependencies updated
20. Apply principle of least privilege

TESTING:
21. Write unit tests for all critical functions
22. Implement integration tests for main flows
23. Use mocks for external dependencies
24. Maintain test coverage above 80%
25. Test error cases and edge cases
26. Use clear naming conventions for tests
27. Organize tests following AAA pattern (Arrange, Act, Assert)

PERFORMANCE:
28. Optimize database queries
29. Use caching when appropriate
30. Avoid unnecessary loops and O(n²) complexity
31. Implement lazy loading for heavy resources
32. Minimize unnecessary HTTP requests
33. Use async/await for asynchronous operations
34. Implement pagination for large datasets
35. Optimize images and static assets

STRUCTURE AND ORGANIZATION:
36. Maintain consistent folder structure
37. Separate code by responsibility (models, views, controllers)
38. Use appropriate design patterns
39. Keep configuration files organized
40. Implement structured logging
41. Use semantic versioning
42. Keep README.md updated
43. Document APIs with OpenAPI/Swagger

DEVELOPMENT BEST PRACTICES:
44. Make small and frequent commits
45. Use descriptive commit messages
46. Implement CI/CD pipeline
47. Use automated linting and formatting
48. Review code before merging
49. Keep minimal necessary dependencies
50. Use TypeScript for JavaScript projects
51. Implement graceful shutdown
52. Use feature flags for gradual rollouts

CODING STANDARDS:
53. Follow language naming conventions
54. Use consistent indentation (2 or 4 spaces)
55. Keep lines under 120 characters
56. Use quotes consistently (single or double)
57. Add trailing commas in arrays/objects
58. Organize imports alphabetically
59. Use destructuring when appropriate
60. Prefer arrow functions for callbacks

DATABASE:
61. Use migrations for schema changes
62. Implement appropriate indexes
63. Normalize data when necessary
64. Use transactions for critical operations
65. Implement automated backup
66. Monitor query performance
67. Use connection pooling

DEPLOYMENT AND MONITORING:
68. Use containers for environment consistency
69. Implement health checks
70. Configure alerts for critical errors
71. Use blue-green deployment
72. Monitor performance metrics
73. Implement automatic rollback
74. Use secrets management

DOCUMENTATION:
75. Document architectural decisions
76. Keep changelog updated
77. Create setup guides for new developers
78. Document public APIs
79. Use JSDoc or equivalent for functions
80. Keep architecture diagrams updated

COLLABORATION:
81. Use pull requests for code review
82. Implement PR templates
83. Keep issues well documented
84. Use consistent Git labels
85. Participate in constructive code reviews
86. Share knowledge with the team
87. Use pair programming when appropriate

RESPONSIVENESS AND ACCESSIBILITY:
88. Implement responsive design
89. Use semantic HTML
90. Add alt text for images
91. Implement keyboard navigation
92. Use colors with adequate contrast
93. Test across different browsers
94. Optimize for mobile-first

MAINTAINABILITY:
95. Refactor code regularly
96. Remove dead code
97. Keep dependencies updated
98. Use static analysis tools
99. Implement quality metrics
100. Plan for future scalability

MICROSERVICES SPECIFIC RULES:
101. Design services with single responsibility principle
102. Implement proper service communication patterns (async when possible)
103. Use proper error handling for distributed systems
104. Implement circuit breaker pattern for external service calls
105. Design APIs with versioning strategy
106. Implement proper logging correlation across services
107. Use containers consistently across all services
108. Design for service independence and minimal coupling
109. Implement proper health checks for all services
110. Use environment-specific configurations for different services