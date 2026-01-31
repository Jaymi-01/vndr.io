"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, Briefcase, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SignUpPage() {
  const [role, setRole] = useState<"client" | "vendor">("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Profile Name
      await updateProfile(user, { displayName: name });

      // 3. Create Firestore Document (Critical Step)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      });

      toast.success("Account created! Redirecting...", { id: toastId });
      
      // 4. Redirect based on role
      if (role === "vendor") {
        router.push("/dashboard/vendor");
      } else {
        router.push("/dashboard/client");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to sign up", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">Join Vndr.io</CardTitle>
          <CardDescription>Choose your account type</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-5">
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("client")}
                className={cn(
                  "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all",
                  role === "client" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <User className={cn(role === "client" ? "text-blue-600" : "text-gray-400")} size={24} />
                <span className={cn("font-bold text-sm", role === "client" ? "text-blue-600" : "text-gray-500")}>Client</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={cn(
                  "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all",
                  role === "vendor" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Briefcase className={cn(role === "vendor" ? "text-blue-600" : "text-gray-400")} size={24} />
                <span className={cn("font-bold text-sm", role === "vendor" ? "text-blue-600" : "text-gray-500")}>Vendor</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your full name" 
                autoComplete="off"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                autoComplete="off"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="pr-10"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-6 font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              {role === "vendor" ? "Create Vendor Account" : "Create Client Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-gray-100 bg-gray-50/50 py-4">
          <p className="text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline ml-1">Log in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
