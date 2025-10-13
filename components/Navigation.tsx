'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  return (
    <nav className="w-full bg-[#0d0d0d] border-b border-[#0d0d0d]">
      <div className="max-w-[1480px] mx-auto px-4 h-12">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <Image
              src="/logo-light.avif"
              alt="Matrix Mirrors"
              width={80}
              height={32}
              className="w-20 h-auto"
              priority
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden px-4 lg:flex lg:items-centeritems-center flex-1 justify-left">
            <a
              href="/about-us"
              className="text-white hover:text-gray-300 transition-colors text-[0.65rem] uppercase tracking-[0.02rem] py-2 px-4"
            >
              About Us
            </a>

            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                onMouseEnter={() => setIsProductsOpen(true)}
                onMouseLeave={() => setIsProductsOpen(false)}
                className="text-white hover:text-gray-300 transition-colors text-[0.65rem] uppercase tracking-[0.02rem] py-2 px-4 flex items-center gap-1"
              >
                Our Products
                <svg
                  className={`w-3 h-3 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProductsOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 bg-white rounded-sm shadow-lg py-2"
                  onMouseEnter={() => setIsProductsOpen(true)}
                  onMouseLeave={() => setIsProductsOpen(false)}
                >
                  <a
                    href="/products"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    View All
                  </a>
                  <a
                    href="/products?product-line=Classic LED Mirrors"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    Classic LED Mirrors
                  </a>
                  <a
                    href="/products?product-line=Future Deco LED Mirrors"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    Future Deco LED Mirrors
                  </a>
                  <a
                    href="/products?product-line=Future LED Mirrors"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    Future LED Mirrors
                  </a>
                  <a
                    href="/products?product-line=Deco LED Mirrors"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    Deco LED Mirrors
                  </a>
                  <a
                    href="/products?product-line=Bright Line LED Mirrors"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    Bright Line LED Mirrors
                  </a>
                  <a
                    href="/products?product-line=Anti-Ligature LED Mirrors"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    Anti-Ligature LED Mirrors
                  </a>
                  <a
                    href="/products?product-line=Polished Mirrors"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    Polished Mirrors
                  </a>
                  <a
                    href="/products?product-line=Suspended LED Mirrors"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    Suspended LED Mirrors
                  </a>
                  <a
                    href="/products?product-line=Makeup Mirrors"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    Makeup Mirrors
                  </a>
                  <a
                    href="/products?product-line=Mirror Cabinet"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProductsOpen(false)}
                  >
                    Mirror Cabinet
                  </a>
                </div>
              )}
            </div>

            <a
              href="/matrix-mirrors-m-series-multi-family"
              className="text-white hover:text-gray-300 transition-colors text-[0.65rem] uppercase tracking-[0.02rem] py-2 px-4"
            >
              M-Series
            </a>

            <a
              href="/find-a-rep-or-showroom"
              className="text-white hover:text-gray-300 transition-colors text-[0.65rem] uppercase tracking-[0.02rem] py-2 px-4"
            >
              Find Reps & Showrooms
            </a>

            <a
              href="/gallery"
              className="text-white hover:text-gray-300 transition-colors text-[0.65rem] uppercase tracking-[0.02rem] py-2 px-4"
            >
              Gallery
            </a>
          </div>

          {/* Contact Button (Desktop) */}
          <div className="hidden lg:flex items-center">
            <a
              href="/contact"
              className="bg-white text-[#0d0d0d] px-6 py-2 rounded text-[0.65rem] hover:bg-gray-100 transition-colors uppercase tracking-[0.02rem] font-medium"
            >
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-full bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-full bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-12 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="flex flex-col p-4 space-y-4">
              <a
                href="/about-us"
                className="text-gray-700 hover:text-gray-900 uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </a>

              <div>
                <button
                  onClick={() => setIsProductsOpen(!isProductsOpen)}
                  className="text-gray-700 hover:text-gray-900 w-full text-left flex items-center justify-between uppercase tracking-wide"
                >
                  Our Products
                  <svg
                    className={`w-4 h-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProductsOpen && (
                  <div className="ml-4 mt-2 space-y-2">
                    <a
                      href="/products"
                      className="block text-gray-600 hover:text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View All
                    </a>
                  </div>
                )}
              </div>

              <a
                href="/matrix-mirrors-m-series-multi-family"
                className="text-gray-700 hover:text-gray-900 uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                M-Series
              </a>

              <a
                href="/find-a-rep-or-showroom"
                className="text-gray-700 hover:text-gray-900 uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Reps & Showrooms
              </a>

              <a
                href="/gallery"
                className="text-gray-700 hover:text-gray-900 uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </a>

              <div className="pt-4 border-t border-gray-200">
                <a
                  href="/contact"
                  className="block bg-gray-100 text-gray-700 px-4 py-2 rounded text-center hover:bg-gray-200 uppercase tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
