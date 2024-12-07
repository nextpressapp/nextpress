import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {NextRequest, NextResponse} from "next/server";
import path from "path";
import fs from "node:fs/promises";


const settingsPath = path.join(process.cwd(), 'src', 'config', 'settings.json')

async function getSiteSettings() {
    const settings = await fs.readFile(settingsPath, 'utf8');
    return JSON.parse(settings)
}

async function updateSiteSettings(newSettings: any) {
    await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2))
}

export async function GET() {
    console.log(settingsPath)
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const newSettings = await request.json()
    await updateSiteSettings(newSettings)
    return NextResponse.json({message: 'Successfully updated site settings'})
}