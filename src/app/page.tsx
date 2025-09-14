export default function Home() {
  return (
    <div className="w-full h-screen overflow-hidden">
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/video.mov" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
