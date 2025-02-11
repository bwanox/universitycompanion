
export default function PostCard({ title, description }) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="font-bold">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    );
  }
  