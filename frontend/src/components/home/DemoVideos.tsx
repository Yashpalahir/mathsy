import { Play, Clock, Eye } from "lucide-react";

const demoVideos = [
  {
    id: 1,
    title: "Introduction to Quadratic Equations",
    duration: "15:30",
    views: "2.5K",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop",
    class: "Class 10",
  },
  {
    id: 2,
    title: "Understanding Trigonometry Basics",
    duration: "18:45",
    views: "3.2K",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=225&fit=crop",
    class: "Class 10",
  },
  {
    id: 3,
    title: "Linear Equations Made Easy",
    duration: "12:20",
    views: "1.8K",
    thumbnail: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&h=225&fit=crop",
    class: "Class 9",
  },
];

export const DemoVideos = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block bg-mathsy-pink/20 text-mathsy-pink font-semibold px-4 py-2 rounded-full text-sm mb-4">
            Free Demo
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Watch <span className="text-primary">Free Demo</span> Lectures
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience our teaching style before enrolling. Watch these free demo classes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {demoVideos.map((video) => (
            <div
              key={video.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
                  </button>
                </div>
                <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
                  {video.class}
                </span>
              </div>
              
              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-foreground mb-3 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {video.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {video.views} views
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
