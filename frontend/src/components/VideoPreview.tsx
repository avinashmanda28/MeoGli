'use client';

interface VideoPreviewProps {
  videoUrl: string;
}

export default function VideoPreview({ videoUrl }: VideoPreviewProps) {
  return (
    <div className="glass rounded-2xl p-8 border border-blue-500/20">
      <h2 className="text-xl font-semibold text-blue-300 mb-6">Video Ready</h2>

      <div className="bg-black rounded-xl overflow-hidden border border-slate-600/30">
        <video
          src={videoUrl}
          controls
          className="w-full"
          controlsList="nodownload"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <a
        href={videoUrl}
        download="meogli-video.mp4"
        className="inline-block mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
      >
        📥 Download Video
      </a>
    </div>
  );
}
