# Exercise 4: Q&A API Server

_Goal: Building an API Server for the Q&A example_

Design and implement and HTTP API server in Express for the Q&A example. Starting from the template project `qa-server` available in the folder:

- Define a set of HTTP APIs for each of common operations on Questions and Answers, write them in the `README.md` file.
    - Operations may be actions such as list, create, add, modify, ...
    - For each API, define the HTTP method, the URL (with parameters), the Request Body (if any), the Response Body (if any), the status code(s) in case of success or failure (with the corresponding error body).
- Implement an HTTP server using Express. Such server must be able to respond to the HTTP URLs defined in the APIs, execute the proper SQL queries on the database, and return the result in JSON format.
    - Remember the server-side validation of input values, and ensure database integrity.
- Test the HTTP server using a client such as RESTClient (e.g., writing a .http file and running requests against the server)

Note: the API **Design** phase **does not have a single solution**, there are many options to explore, with their pros and cons. We will discuss some of them during the design phase.
