import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComingSoon() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md p-6 text-center">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold">
                        Coming Soon
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-6">
                        We&#39;re working hard to bring something amazing to
                        you. Stay tuned!
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
