
---
openapi: 3.0.3
info:
  title: AI Task Manager API
  description: API specification for the AI-Powered Task Manager v1.0.
  version: 1.0.0
servers:
  - url: /api/v1
    description: API Server

# 1. API Tags
tags:
  - name: Auth
    description: User authentication and session management.
  - name: Tasks
    description: Operations for managing tasks.
  - name: AI
    description: AI-powered services like task prioritization.
  - name: Events
    description: Activity timeline and event logging.
  - name: Analytics
    description: Endpoints for the analytics dashboard.

# 2. Reusable Components (Schemas)
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
        email:
          type: string
          format: email
          example: 'user@example.com'
        createdAt:
          type: string
          format: date-time

    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
        userId:
          type: string
          format: uuid
        title:
          type: string
          example: 'Refactor the authentication module'
        description:
          type: string
          example: 'Update the legacy auth code to use the new JWT library.'
        priority:
          type: integer
          format: int32
          minimum: 1
          maximum: 10
          example: 8
        status:
          type: string
          enum: [todo, pending, done]  # Updated to match actual implementation
          example: 'pending'
        dueDate:
          type: string
          format: date-time
          example: '2025-12-31T23:59:59.999Z'
        aiScore:
          type: integer
          minimum: 0
          maximum: 100
          example: 85
        completedAt:
          type: string
          format: date-time  # Added to match our implementation
          nullable: true
          example: '2025-12-01T10:30:00.000Z'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Event:
      type: object
      properties:
        id:
          type: string
          format: uuid
        action:
          type: string
          example: 'task.created'
        timestamp:
          type: string
          format: date-time
        metadata:
          type: object
          properties:
            taskId:
              type: string
              format: uuid
            userId:
              type: string
              format: uuid

    AnalyticsOverview:
      type: object
      properties:
        totalTasks:
          type: integer
          example: 150
        completedTasks:
          type: integer
          example: 95
        pendingTasks:
          type: integer
          example: 55
        weeklyActivity:
          type: array
          items:
            type: object
            properties:
              day:
                type: string
                example: 'Monday'
              tasksCompleted:
                type: integer
                example: 12

# 3. API Paths
paths:
  /auth/signup:
    post:
      tags: [Auth]
      summary: Register a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /auth/login:
    post:
      tags: [Auth]
      summary: Log in a user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:
                    type: string
                    format: jwt

  /tasks:
    get:
      tags: [Tasks]
      summary: Get all tasks for the authenticated user
      security:
        - bearerAuth: []
      responses:
        '200':
          description: A list of tasks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'
    post:
      tags: [Tasks]
      summary: Create a new task
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Task' # Simplified for creation
      responses:
        '201':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'

  /tasks/{id}:
    patch:
      tags: [Tasks]
      summary: Update an existing task
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Task' # Partial updates allowed
      responses:
        '200':
          description: Task updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
    delete:
      tags: [Tasks]
      summary: Delete a task
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: Task deleted successfully

  /tasks/{id}/complete:
    patch:
      tags: [Tasks]
      summary: Mark a task as completed
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Task marked as completed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'

  /tasks/{id}/pending:
    patch:
      tags: [Tasks]
      summary: Mark a task as pending
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Task marked as pending
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'

  /ai/prioritize:
    post:
      tags: [AI]
      summary: Trigger AI prioritization for the user's tasks
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Prioritization complete, returns the updated task list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'

  /events:
    get:
      tags: [Events]
      summary: Get activity events for the user
      security:
        - bearerAuth: []
      parameters:
        - name: filter
          in: query
          required: false
          schema:
            type: string
            enum: [today, week, all]
      responses:
        '200':
          description: A list of activity events
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Event'

  /analytics/overview:
    get:
      tags: [Analytics]
      summary: Get overview analytics for the dashboard
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Analytics overview data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AnalyticsOverview'
  /health:
    get:
      summary: Health check endpoint
      responses:
        '200':
          description: Service health status
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: 'OK'
                  timestamp:
                    type: string
                    format: date-time
                    example: '2025-12-03T12:00:00.000Z'
                  service:
                    type: string
                    example: 'AI Task Manager API'
