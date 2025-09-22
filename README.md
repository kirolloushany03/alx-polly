# ALX Polly: A Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This project allows users to create, share, and vote on polls. It serves as a practical learning ground for modern web development concepts, including security best practices.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Backend & Database**: [Supabase](https://supabase.io/)
-   **UI**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
-   **State Management**: React Server Components and Client Components

## Features

-   **User Authentication**: Secure sign-up and login functionality.
-   **Poll Management**: Users can create, view, edit, and delete their own polls.
-   **Interactive Voting**: Cast votes on polls and see results update in real-time.
-   **Visual Results**: Poll results are displayed in a clear bar chart.
-   **Easy Sharing**: Share polls with others via a direct link or a scannable QR code.

## Getting Started

To get the application running on your local machine, follow these steps.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or higher recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A [Supabase](https://supabase.io/) account.

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd alx-polly
npm install
```

### 3. Supabase Configuration

1.  Go to your Supabase dashboard and create a new project.
2.  Navigate to the **SQL Editor** and run the following schema to create the necessary tables:

    ```sql
    -- Create the polls table
    CREATE TABLE polls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      question TEXT NOT NULL,
      options TEXT[] NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Create the votes table
    CREATE TABLE votes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      option_index INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(poll_id, user_id) -- Ensures a user can only vote once per poll
    );
    ```

3.  In your Supabase project settings, go to the **API** section and find your Project URL and `anon` key.

### 4. Environment Variables

Create a `.env.local` file in the root of the project and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 5. Running the Development Server

Start the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

-   **Register/Login**: Create an account or log in to get started.
-   **Create a Poll**: Navigate to the "Create Poll" page, enter a question and at least two options, and submit.
-   **View Your Polls**: The dashboard will display all the polls you have created.
-   **Vote on a Poll**: Click on any poll to view its details and cast your vote.
-   **Edit/Delete Polls**: You can edit or delete your own polls from the dashboard.

## API Routes

The application provides a RESTful API for managing polls.

### Polls

-   `GET /api/polls`: Fetches all polls for the authenticated user.
-   `POST /api/polls`: Creates a new poll.
-   `GET /api/polls/:id`: Fetches a single poll by its ID.
-   `PUT /api/polls/:id`: Updates a poll.
-   `DELETE /api/polls/:id`: Deletes a poll.
-   `POST /api/polls/:id/vote`: Submits a vote for a poll.

## Running Tests

This project is not yet configured with a test suite. To add testing, you would typically:

1.  Install a testing framework like Jest and React Testing Library.
2.  Configure the framework in the project.
3.  Write tests for components, server actions, and utilities.
4.  Add a `test` script to your `package.json`.