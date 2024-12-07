"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";

const formSchema = z.object({
  siteName: z.string().min(1, { message: "Site name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  homeTitle: z.string().min(1, { message: "Home page title is required" }),
  homeDescription: z
    .string()
    .min(1, { message: "Home page description is required" }),
  aboutTitle: z.string().min(1, { message: "About page title is required" }),
  aboutDescription: z
    .string()
    .min(1, { message: "About page description is required" }),
});

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      siteName: "",
      description: "",
      homeTitle: "",
      homeDescription: "",
      aboutTitle: "",
      aboutDescription: "",
    },
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((response) => response.json())
      .then((settings) => {
        setSettings(settings);
        form.reset({
          siteName: settings.siteName,
          description: settings.description,
          homeTitle: settings.pages.home.title,
          homeDescription: settings.pages.home.description,
          aboutTitle: settings.pages.about.title,
          aboutDescription: settings.pages.about.description,
        });
      });
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const newSettings = {
      ...settings,
      siteName: values.siteName,
      description: values.description,
      pages: {
        home: {
          title: values.homeTitle,
          description: values.homeDescription,
        },
        about: {
          title: values.aboutTitle,
          description: values.aboutDescription,
        },
      },
    };

    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSettings),
    });

    if (response.ok) {
      setSettings(newSettings);
        toast({
            title: "Settings Updated",
            description: "Site Settings Updated successfully.",
        });
    } else {
        toast({
            title: "Error",
            description: "Failed to update Site Settings.",
            variant: 'destructive'
        });
    }
  }

  return (
    <div className="items-center justify-center min-h-screen bg-background">
      <h1 className="text-3xl font-semibold mb-8">Site Settings</h1>
      <div className="flex flex-col justify-center items-center">
        <Card className="w-[350px]">
          <CardHeader className="flex items-center justify-center space-y-0 pb-2">
            <CardTitle>Site Settings</CardTitle>
            <CardDescription>
              Update your site&#39;s global and page-specific settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homeTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Page Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homeDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Page Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aboutTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Page Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aboutDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Page Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">Update Settings</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}