/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // The 3D version used to live at /3d before it became the homepage
  async redirects() {
    return [{ source: "/3d", destination: "/", permanent: false }]
  },
}

export default nextConfig
