import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Shield, Clock, Heart, X } from "lucide-react";
import { caregivers } from "@/data/mockData";

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(caregivers.slice(0, 3));

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-2">Favorites</h1>
      <p className="text-muted-foreground mb-6">Caregivers you've saved</p>

      {favorites.length > 0 ? (
        <div className="space-y-4">
          {favorites.map(cg => (
            <Card key={cg.id} className="card-elevated border-transparent">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <img src={cg.avatar} alt={cg.name} className="w-16 h-16 rounded-xl object-cover cursor-pointer" onClick={() => navigate(`/caregiver/${cg.id}`)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{cg.name}</h3>
                      {cg.verified && <Shield className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning fill-warning" /> {cg.rating}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {cg.location}</span>
                      <span>${cg.hourlyRate}/hr</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cg.specialty.map(s => <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground text-xs">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="coral" size="sm" onClick={() => navigate(`/caregiver/${cg.id}`)}>Book</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFavorite(cg.id)}>
                      <Heart className="h-4 w-4 fill-coral text-coral" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No favorites yet</p>
          <Button variant="coral" className="mt-4" onClick={() => navigate("/search")}>Browse Caregivers</Button>
        </div>
      )}
    </div>
  );
}
