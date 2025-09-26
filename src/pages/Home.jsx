import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl py-10">
      <h1 className="mb-4 text-3xl font-bold">Welcome to VidyaVichara</h1>
      <p className="mb-8 text-gray-600">
        Students post questions as sticky notes. Instructors manage and answer them in live classes.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card
          title="Ask a question"
          desc="Students can post and browse questions during the class."
          cta="Go to Board"
          to="/board"
        />
        <Card
          title="Instructor tools"
          desc="Create a class, manage questions, and end the class."
          cta="Open Dashboard"
          to="/dashboard"
        />
      </div>
    </div>
  );
}

function Card({ title, desc, cta, to }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-semibold">{title}</h2>
      <p className="mb-4 text-sm text-gray-600">{desc}</p>
      <Link to={to} className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-white">
        {cta}
      </Link>
    </div>
  );
}
