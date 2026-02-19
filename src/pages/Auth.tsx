import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { careAuth } from "@/integrations/supabase/external-client";
import { Heart } from "lucide-react";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast({ title: "Welcome back!" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signup(signupName, signupEmail, signupPassword, "care-seeker");
      toast({ title: "Account created! Check your email to verify." });
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-transparent card-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl hero-gradient flex items-center justify-center mb-3">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Care·Connected</CardTitle>
          <CardDescription>Find and manage trusted care</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={initialMode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 mt-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              <Button variant="coral" className="w-full" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center">
                <button type="button" className="text-sm text-primary hover:underline" onClick={() => setForgotOpen(true)}>Forgot password?</button>
              </div>
              {forgotOpen && (
                <div className="border rounded-lg p-4 mt-2 space-y-3 bg-muted/30">
                  <p className="text-sm text-foreground font-medium">Reset your password</p>
                  <Input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Enter your email" />
                  <Button variant="outline" className="w-full" disabled={forgotLoading} onClick={async () => {
                    if (!forgotEmail) { toast({ title: "Enter your email", variant: "destructive" }); return; }
                    setForgotLoading(true);
                    try {
                      const { error } = await careAuth.auth.resetPasswordForEmail(forgotEmail, {
                        redirectTo: `${window.location.origin}/reset-password`,
                      });
                      if (error) throw error;
                      toast({ title: "Reset link sent!", description: "Check your email for a password reset link." });
                      setForgotOpen(false);
                    } catch (err: any) {
                      toast({ title: "Failed", description: err.message, variant: "destructive" });
                    } finally {
                      setForgotLoading(false);
                    }
                  }}>
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="signup" className="space-y-4 mt-4">
              <div>
                <Label>Full Name</Label>
                <Input value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button variant="coral" className="w-full" onClick={handleSignup} disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
