import "../src/styles.css";

export const metadata = {
  title: "Chat TAB Top Plugin Add Entry Demo",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
