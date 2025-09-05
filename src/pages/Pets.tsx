import { useState } from 'react';
import { Plus, Camera, Edit2, Trash2, Heart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Pet {
  id: string;
  name: string;
  breed: string;
  weight: string;
  age: string;
  photo?: string;
}

const Pets = () => {
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([
    {
      id: '1',
      name: 'Rex',
      breed: 'Vira-lata',
      weight: '12 kg',
      age: '3 anos',
      photo: '🐕'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    weight: '',
    age: '',
    photo: '🐕'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPet) {
      // Update existing pet
      setPets(pets.map(pet => 
        pet.id === editingPet.id 
          ? { ...pet, ...formData }
          : pet
      ));
      toast({
        title: "Pet atualizado!",
        description: `${formData.name} foi atualizado com sucesso.`,
      });
    } else {
      // Add new pet
      const newPet: Pet = {
        id: Date.now().toString(),
        ...formData
      };
      setPets([...pets, newPet]);
      toast({
        title: "Pet cadastrado!",
        description: `${formData.name} foi adicionado com sucesso.`,
      });
    }

    // Reset form
    setFormData({ name: '', breed: '', weight: '', age: '', photo: '🐕' });
    setEditingPet(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      breed: pet.breed,
      weight: pet.weight,
      age: pet.age,
      photo: pet.photo || '🐕'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    setPets(pets.filter(p => p.id !== petId));
    toast({
      title: "Pet removido",
      description: `${pet?.name} foi removido da lista.`,
      variant: "destructive",
    });
  };

  const handleNewPet = () => {
    setEditingPet(null);
    setFormData({ name: '', breed: '', weight: '', age: '', photo: '🐕' });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Meus <span className="text-primary">Pets</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gerencie as informações dos seus companheiros peludos
          </p>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleNewPet}
                className="pet-button bg-gradient-pet border-0"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Pet
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPet ? 'Editar Pet' : 'Adicionar Novo Pet'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Selector */}
                <div className="space-y-2">
                  <Label htmlFor="photo">Foto do Pet</Label>
                  <div className="flex gap-2 flex-wrap">
                    {['🐕', '🐈', '🐰', '🐦', '🐹', '🐢'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: emoji })}
                        className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                          formData.photo === emoji 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Pet</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Rex, Luna, Max..."
                    required
                    className="pet-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Raça</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="Ex: Labrador, Siamês, Vira-lata..."
                    required
                    className="pet-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Ex: 3 anos"
                      required
                      className="pet-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="Ex: 12 kg"
                      required
                      className="pet-input"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full pet-button">
                  {editingPet ? 'Atualizar Pet' : 'Cadastrar Pet'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pets Grid */}
        {pets.length === 0 ? (
          <Card className="pet-card">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-2xl font-semibold mb-2">Nenhum pet cadastrado</h3>
              <p className="text-muted-foreground mb-6">
                Comece adicionando o primeiro pet da família!
              </p>
              <Button 
                onClick={handleNewPet}
                className="pet-button"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Primeiro Pet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pets.map((pet) => (
              <Card key={pet.id} className="pet-card group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-pet rounded-full flex items-center justify-center text-3xl">
                        {pet.photo}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{pet.name}</CardTitle>
                        <p className="text-muted-foreground">{pet.breed}</p>
                      </div>
                    </div>
                    
                    <Heart className="w-6 h-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Idade:</span>
                      <span className="font-medium">{pet.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peso:</span>
                      <span className="font-medium">{pet.weight}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(pet)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(pet.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {pets.length > 0 && (
          <div className="mt-16">
            <Card className="pet-card bg-gradient-care">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Próximos Passos</h3>
                <p className="text-muted-foreground mb-6">
                  Agora que você cadastrou seus pets, que tal agendar uma consulta?
                </p>
                <Button className="pet-button bg-gradient-pet">
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Consulta
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pets;