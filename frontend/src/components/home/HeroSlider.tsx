import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import sankalpImg from "@/assets/sankalp.png";
import shaktiImg from "@/assets/shakti.png";

const banners = [
    {
        id: 1,
        image: sankalpImg,
        alt: "Sankalp Banner",
    },
    {
        id: 2,
        image: shaktiImg,
        alt: "Shakti Banner",
    },
];

export const HeroSlider = () => {
    const [api, setApi] = useState<CarouselApi>();
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!api || isPaused) return;

        const intervalId = setInterval(() => {
            api.scrollNext();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [api, isPaused]);

    return (
        <section
            className="relative w-full overflow-hidden bg-background"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {banners.map((banner) => (
                        <CarouselItem key={banner.id} className="basis-full">
                            <Link to="/courses" className="block cursor-pointer">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.1 }}
                                    className="w-full"
                                >
                                    <img
                                        src={banner.image}
                                        alt={banner.alt}
                                        className="w-full h-auto blockAbout"
                                        loading="eager"
                                    />
                                </motion.div>
                            </Link>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="absolute inset-y-0 left-4 md:left-8 flex items-center z-10">
                    <CarouselPrevious className="static translate-y-0 h-10 w-10 md:h-12 md:w-12 bg-black/20 hover:bg-black/40 border-none text-white backdrop-blur-sm transition-all" />
                </div>
                <div className="absolute inset-y-0 right-4 md:right-8 flex items-center z-10">
                    <CarouselNext className="static translate-y-0 h-10 w-10 md:h-12 md:w-12 bg-black/20 hover:bg-black/40 border-none text-white backdrop-blur-sm transition-all" />
                </div>
            </Carousel>
        </section>
    );
};
