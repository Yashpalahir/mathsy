import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    content: "+91 9375919696",
    link: "tel:+919375919696",
  },
  {
    icon: Mail,
    title: "Email",
    content: "info@mathsy.com",
    link: "mailto:info@mathsy.com",
  },
  {
    icon: MapPin,
    title: "Address",
    content: "Baner, Pune, India - 411057",
    link: "#map",
  },
  {
    icon: Clock,
    title: "Working Hours",
    content: "Mon - Sat: 9:00 AM - 8:00 PM",
    link: null,
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.createContact(formData);
      if (response.success) {
        toast.success("Thank you! We'll get back to you soon.");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Contact <span className="text-secondary">Us</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Have questions? We'd love to hear from you. Reach out and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-8">Get in Touch</h2>

              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                {contactInfo.map((item, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 shadow-card">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    {item.link ? (
                      <a href={item.link} className="text-muted-foreground hover:text-primary transition-colors">
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">{item.content}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Map */}
              <div id="map" className="rounded-xl overflow-hidden h-64 bg-muted">
                <iframe
                  src="https://www.google.com/maps?q=Shree+Radhe+Krishna+Colony,+Marunji+Rd,+near+Shree+Ram+Chowk,+Phase+1,+Hinjawadi+Rajiv+Gandhi+Infotech+Park,+Pimpri-Chinchwad,+Pune,+Maharashtra+411057&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mathsy Location"
                />
              </div>


            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Send us a Message</h2>
                <p className="text-muted-foreground mb-8">Fill out the form and we'll be in touch within 24 hours.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                      <Input
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <Input
                        //placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                    <Input
                      type="email"
                      //  placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                    <Input
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                    <Textarea
                      placeholder="Your message..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
