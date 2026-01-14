import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Equipo no encontrado
      </h1>
      <p className="text-gray-600 mb-8">
        El equipo que buscas no existe o ha sido eliminado.
      </p>
      <Link
        href="/catalogo"
        className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Volver al catálogo
      </Link>
    </div>
  );
}
