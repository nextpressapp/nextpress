"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import zxcvbn from "zxcvbn";

import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .refine((password) => {
    const result = zxcvbn(password);
    return result.score >= 3;
  }, "Password is too weak. Please choose a stronger password.");

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: passwordSchema,
    confirmPassword: z.string(),
    captcha: z.string().length(6, "CAPTCHA must be 6 characters long"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      captcha: "",
    },
  });

  const loadCaptcha = async () => {
    const response = await fetch("/api/auth/captcha");
    const data = await response.json();
    setCaptcha(data.captcha);
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const checkPasswordStrength = (password: string) => {
    const result = zxcvbn(password);
    setPasswordStrength(result.score);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          captcha: values.captcha,
        }),
      });

      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account.",
        });
        router.push("/auth/login");
      } else {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during registration.",
        variant: "destructive",
      });
      loadCaptcha(); // Reload CAPTCHA on failure
    } finally {
      setIsLoading(false);
      form.reset({ captcha: "" }); // Reset only the CAPTCHA field
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card>
        <CardHeader className="justify-center items-center">
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          checkPasswordStrength(e.target.value);
                        }}
                      />
                    </FormControl>
                    <Progress
                      value={passwordStrength * 25}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500">
                      {passwordStrength === 0 && "Very Weak"}
                      {passwordStrength === 1 && "Weak"}
                      {passwordStrength === 2 && "Fair"}
                      {passwordStrength === 3 && "Strong"}
                      {passwordStrength === 4 && "Very Strong"}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="captcha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CAPTCHA</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="border border-gray-300 p-2 rounded-md font-mono text-lg text-center">
                          {captcha}
                        </div>
                        <Input placeholder="Enter CAPTCHA" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
