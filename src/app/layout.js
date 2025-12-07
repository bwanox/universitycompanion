import "./globals.css";
import { AuthProvider } from "./auth/AuthContext";
import NavigationMenu from "./components/NavigationMenu";

export const metadata = {
  title: "Unifriend",
  description: "University Companion App",
  icons: {
    icon: [
      { url: "/unifriendlogo.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/unifriendlogo.svg", sizes: "16x16", type: "image/svg+xml" },
      { url: "/unifriendlogo.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
    shortcut: "/unifriendlogo.svg",
    apple: "/unifriendlogo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Force favicon refresh with cache busting */}
        <link rel="icon" href="/unifriendlogo.svg?v=1" type="image/svg+xml" />
        <link rel="shortcut icon" href="/unifriendlogo.svg?v=1" type="image/svg+xml" />
      </head>
      <body>
        <div>
          <main>
            <AuthProvider>
              <NavigationMenu />
              {children}
            </AuthProvider>
          </main>
        </div>
      </body>
    </html>
  )
}