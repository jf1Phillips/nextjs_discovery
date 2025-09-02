import "@/styles/globals.css";

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
            <body className="bg-customGrey">{children}</body>
        </html>
    )
}
