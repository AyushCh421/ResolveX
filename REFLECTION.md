# Reflection: building ResolveX

## Why this idea
In our own college we make a complaint and it is not resolved until we force it to be done. And this is not only limited to our college there are many colleges, offices and workplaces with the same problem. So I wanted every complaint to have an ID, an owner, a status and a visible history. So the concerned authority may consider it as an responsibility and a record of it can be maintained too.

## How I approached it
I chose the MERN stack because of primarily two reasons, firstly i have already done projects in MERN so working on the same tech stack make it easier and also add something new to the learning, and seondly maintaining one language across the whole project let me focus on the product. I split the work into four stages, and each one ended with something I could run and test: the backend API and models, the client foundation with login, the student portal, and the admin portal with analytics and documentation. I used an AI assistant to help generate and review code. I ran every feature, tested it, fixed the problems it produced, and I can explain how each part works.

## Key decisions
- Activity rows in a separate collection instead of embedding history in each issue, so the timeline is a simple sorted query.
- Random ticket IDs with a unique index and retry, which avoids a counter collection and a race between simultaneous submissions.
- One `$facet` aggregation for analytics, so the dashboard needs one database round trip.
- One shared complaint detail view for students and admins, so the timeline cannot differ between them.
- MVP first I left out AI classification, live chat and notifications until the core flow was reliable.

## Challenges
- A leftover Tailwind setup outside my project was picked up automatically and broke the build. I found it by reading the error path, and fixed it with an empty inline PostCSS config.
- The dev server kept resetting connections because file watching restarted it inside a OneDrive folder. I moved the project out and used `npm start`.
- Cloudinary returned "Invalid Signature" because the API secret was blank. A small script that printed which variables were set showed the missing one.
- Real credentials ended up inside `.env.example`. I caught them with `git grep` before my first commit, restored placeholders, and rotated the credentials.

## What I would do next
Automated tests, database indexes for the heavy queries, email notifications on status changes, and the AI classification and live chat I deliberately left out.