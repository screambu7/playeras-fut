import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚽</span>
              </div>
              <span className="text-xl font-bold text-white">Playeras Fut</span>
            </Link>
            <p className="text-sm text-gray-400">
              Tu tienda especializada en playeras de fútbol oficiales. Las mejores ligas y equipos del mundo.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-white transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="hover:text-white transition-colors">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Ligas</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/catalogo?liga=La Liga" className="hover:text-white transition-colors">
                  La Liga
                </Link>
              </li>
              <li>
                <Link href="/catalogo?liga=Premier League" className="hover:text-white transition-colors">
                  Premier League
                </Link>
              </li>
              <li>
                <Link href="/catalogo?liga=Serie A" className="hover:text-white transition-colors">
                  Serie A
                </Link>
              </li>
              <li>
                <Link href="/catalogo?liga=Bundesliga" className="hover:text-white transition-colors">
                  Bundesliga
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">Email: info@playerasfut.com</li>
              <li className="text-gray-400">Tel: +34 900 123 456</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Playeras Fut. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
