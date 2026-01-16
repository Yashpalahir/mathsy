import { motion } from "framer-motion";
import { Calendar, Users, MessageCircle, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CourseCardProps {
    title: string;
    subtitle?: string;
    bannerImage?: string;
    bannerTitle?: string;
    bannerSubtitle?: string;
    teacherGroupImage?: string;
    yellowTagText?: string;
    startDate?: string;
    endDate?: string;
    price: number;
    oldPrice?: number;
    language?: string;
    promoText?: string;
    discount?: number;
    onlineTag?: boolean;
    audienceText?: string;
    onExplore?: () => void;
    onBuy?: () => void;
}

export const CourseCard = ({
    title,
    subtitle,
    bannerImage,
    bannerTitle,
    bannerSubtitle,
    teacherGroupImage,
    yellowTagText = "COMEBACK KIT INCLUDED",
    startDate,
    endDate,
    price,
    oldPrice,
    language = "Hinglish",
    promoText = "New Batch Plans Included",
    discount,
    onlineTag = true,
    audienceText,
    onExplore,
    onBuy,
}: CourseCardProps) => {

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="max-w-sm w-full bg-white rounded-[20px] shadow-sm border border-[#E5E5E5] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl"
        >
            {/* Top Banner Section */}
            <div className="relative h-[200px] w-full overflow-hidden">
                {/* Online Tag Ribbon */}
                {onlineTag && (
                    <div className="absolute top-4 left-0 z-20">
                        {/* <div className="bg-gradient-to-r from-[#5A34F0] to-[#9D50BB] text-white text-[10px] font-bold px-3 py-1 rounded-r-full shadow-md">
                            ONLINE
                        </div> */}
                    </div>
                )}

                {/* Banner Image / Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: bannerImage ? `url(${bannerImage})` : 'linear-gradient(135deg, #cbcd38ff 0%, #FFD54F 100%)',
                    }}
                >
                    {/* Overlay content if banner provided manually or just text */}
                    <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white p-4">
                        <h3 className="text-3xl font-black uppercase tracking-wider mb-1 text-center leading-tight drop-shadow-lg">
                            {bannerTitle || title}
                        </h3>
                        <p className="text-sm font-medium opacity-90 tracking-wide uppercase drop-shadow-md">
                            {bannerSubtitle || subtitle}
                        </p>
                    </div>
                </div>

                {/* Teacher Row / Yellow Tag */}
                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent">
                    {teacherGroupImage && (
                        <img src={teacherGroupImage} alt="Teachers" className="h-10 object-contain drop-shadow-md" />
                    )}
                    <div className="bg-[#FFD54F] text-[#1a1a1a] text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                        {yellowTagText}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex-grow space-y-4">
                {/* Course Title Row */}
                <div className="flex items-start justify-between gap-4">
                    <h4 className="text-[17px] font-bold text-[#1a1a1a] leading-tight">
                        {title}
                    </h4>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-[#F3F0FF] text-[#5A34F0] text-[11px] font-semibold px-3 py-1 rounded-full border border-[#E5DFFF]">
                            {language}
                        </div>
                        <button className="w-8 h-8 rounded-full border border-[#E1E1E1] flex items-center justify-center text-[#25D366] hover:bg-[#F0FFF6] transition-colors">
                            <MessageCircle size={16} fill="currentColor" strokeWidth={1} />
                        </button>
                    </div>
                </div>

                {/* Audience Section */}
                {audienceText && (
                    <div className="flex items-center gap-2 text-[#666666]">
                        <Users size={16} className="text-[#5A34F0]" />
                        <span className="text-sm font-medium">{audienceText}</span>
                    </div>
                )}

                {(startDate || endDate) && (
                    <div className="flex items-center gap-2 text-[#666666]">
                        <Calendar size={16} className="text-[#5A34F0]" />
                        <span className="text-sm font-medium">
                            {startDate && new Date(startDate).toLocaleDateString()}

                        </span>

                    </div>
                )}

                {/* Promo Section */}
                <div className="w-full bg-[#1a1a1a] rounded-xl p-3 flex items-center justify-between text-white my-2">
                    <span className="text-[11px] font-semibold tracking-wide">
                        {promoText}
                    </span>
                    <div className="bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#FDB931] text-[10px] font-black px-2 py-0.5 rounded text-black shadow-inner">
                        INFINITY
                    </div>
                </div>

                {/* Price Section */}
                <div className="pt-2">
                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-black text-[#1a1a1a]">₹{price.toLocaleString()}</span>
                        {oldPrice && (
                            <span className="text-sm text-[#999999] line-through font-medium">₹{oldPrice.toLocaleString()}</span>
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-[#666666] font-medium">For a Month</span>
                        {discount && (
                            <div className="bg-[#E4F9EC] text-[#00A859] text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-[#C5EBCE]">
                                Discount of {discount}% applied
                            </div>
                        )}
                    </div>
                </div>

                {/* Buttons Section */}
                <div className="flex gap-3 pt-3">
                    <Button
                        variant="outline"
                        onClick={onExplore}
                        className="flex-1 h-12 rounded-[12px] border-[#E5E5E5] text-[#1a1a1a] font-bold text-sm hover:bg-[#F8F8F8] transition-all"
                    >
                        Explore
                    </Button>
                    <Button
                        onClick={onBuy}
                        className="flex-1 h-12 rounded-[12px] bg-[#5A34F0] text-white font-bold text-sm hover:bg-[#4828C9] shadow-lg shadow-[#5A34F0]/20 transition-all border-none"
                    >
                        Buy Now
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
