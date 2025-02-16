"use client";

import { useUser } from '@/lib/providers/user.provider';
import Image from 'next/image';
import { Pencil, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AccountPage() {
    const { user, profile } = useUser();

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-4">
                <div className="flex flex-col items-center">
                    <h2 className="text-3xl font-large mb-4">Account</h2>
                    <div className="relative flex flex-col items-center p-6">
                        {profile?.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt="Profile Picture"
                                width={100}
                                height={100}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="rounded-full border-2 border-gray-300 flex items-center justify-center w-24 h-24">
                                <User className="h-12 w-12 text-gray-600" />
                                <button className="absolute bottom-6 right-6 bg-gray-200 p-2 rounded-full">
                                    <Pencil className="h-4 w-4 text-gray-600" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center mt-4">
                        <h2 className="text-2xl font-semibold">{profile?.full_name || 'Full Name'}</h2>
                        <Pencil className="ml-2 h-4 w-4 text-gray-600 cursor-pointer" />
                    </div>
                    <p className="text-1xl p-3 text-gray-600">{user?.email || 'Email'}</p>
                </div>

                <div className="w-3/5 mx-auto">
                    <h2 className="text-xl font-small pl-2 mb-2">Account Settings</h2>
                    <Card className="p-5">
                        <div className="flex items-start gap-4">
                            <div>
                                <h3 className="pb-1 text-primary text-sm">
                                    Manage your account settings and set preferences
                                </h3>
                                <h3 className="font-semibold mb-2">Settings 1</h3>
                                <div className="mt-2 space-y-1 text-sm">
                                    {/* Placeholder for settings options */}
                                    <div>Option 1</div>
                                    <div>Option 2</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
