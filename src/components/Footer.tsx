"use client";

import Link from "next/link";
import { Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  AirCover
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Safety information
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Supporting people with disabilities
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Cancellation options
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Community</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Disaster relief housing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Combating discrimination
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Hosting</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Airbnb your home
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  AirCover for Hosts
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Hosting resources
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Community forum
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Airbnb</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Newsroom
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  New features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:underline">
                  Investors
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
            <p className="text-sm">© 2023 Airbnb, Inc.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-gray-600 hover:underline">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:underline">
                Terms
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:underline">
                Sitemap
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              <Link href="#" className="text-sm font-medium hover:underline">
                English (US)
              </Link>
            </div>
            <div>
              <Link href="#" className="text-sm font-medium hover:underline">
                $ USD
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
