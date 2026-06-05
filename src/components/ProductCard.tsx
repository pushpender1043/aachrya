import { ShoppingCart, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    description: string | null;
    image_url: string;
    stock: number;
    category?: string;
  };
  onAddToCart: (product: any) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <div className="group relative w-full">
      {/* 1. Card Container with Glassmorphism & Gradient Border */}
      <div className="relative overflow-hidden rounded-2xl bg-card/40 backdrop-blur-md border border-white/10 shadow-xl transition-all duration-500 hover:shadow-primary/20 hover:border-primary/50 hover:-translate-y-2">
        
        {/* 2. Image Section */}
        <div className="relative h-64 overflow-hidden">
          {/* Badge */}
          <div className="absolute top-3 right-3 z-20">
             {product.stock > 0 ? (
                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 backdrop-blur-md border-0">
                  In Stock
                </Badge>
             ) : (
                <Badge variant="destructive" className="backdrop-blur-md">
                  Out of Stock
                </Badge>
             )}
          </div>

          {/* Product Image with Zoom Effect */}
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay Gradient (Dark at bottom for text readability) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

          {/* Quick Actions (Appear on Hover) */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20 px-4">
             {/* View Details Button (Optional) */}
             {/* <Button size="icon" variant="secondary" className="rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border-0">
                <Eye className="w-4 h-4" />
             </Button> */}
          </div>
        </div>

        {/* 3. Content Section */}
        <div className="p-5 relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
                <p className="text-xs text-primary font-medium tracking-wider uppercase mb-1">{product.category || "Spiritual"}</p>
                <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
                </h3>
            </div>
            <div className="flex items-center gap-1 text-yellow-500 text-xs bg-yellow-500/10 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                <span>4.8</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
            {product.description || "Experience the divine energy with this authentic spiritual product."}
          </p>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Price</span>
                <span className="text-xl font-bold text-white">₹{product.price}</span>
            </div>

            <Button
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className={cn(
                "rounded-full px-6 transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)]",
                product.stock === 0 ? "opacity-50 cursor-not-allowed" : "bg-primary hover:bg-primary/90 glow-effect"
              )}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock === 0 ? "Sold Out" : "Add"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Background Glow Effect behind card */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500 -z-10" />
    </div>
  );
};

export default ProductCard;