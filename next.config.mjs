/** @type {import('next').NextConfig} */
const nextConfig = {
  // Old addresses: the 3D preview lived at /3d, the retired 2D version at /classic
  async redirects() {
    return [
      { source: "/3d", destination: "/", permanent: false },
      { source: "/classic", destination: "/", permanent: false },
    ]
  },
}

export default nextConfig
