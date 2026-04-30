import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/shop?category=${category._id}`}
      className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow block"
    >
      <div className="aspect-square overflow-hidden">
        {category.image?.url ? (
          <img
            src={category.image.url}
            alt={category.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-freshblue/20 to-freshblue/5 flex items-center justify-center">
            <span className="text-4xl">🛒</span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="font-semibold text-lg">{category.name}</h3>
        {category.description && (
          <p className="text-sm text-white/90 line-clamp-1">{category.description}</p>
        )}
      </div>
    </Link>
  );
}
