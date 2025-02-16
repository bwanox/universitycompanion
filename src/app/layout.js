import "./globals.css";
import { AuthProvider } from "./auth/AuthContext";
import NavigationMenu from "./components/NavigationMenu";

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Your App Title</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
    <div>
      <main>
      <AuthProvider>
        {children}
        <div className="nav-fixed">
            <NavigationMenu />
          </div>
        </AuthProvider>

        </main>
    </div>
    </body>
    </html>
  )
}