import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next"


export const metadata = {
    title: 'My app',
    description: 'Description',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr">
            <body className="bg-customBackground">{children}</body>
            <Analytics />
        </html>
    )
}
