"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { accountProfileSchema } from "@/lib/account-profile-schema";
import { normalizeKazakhstanPhone } from "@/lib/checkout-schema";
import { prisma } from "@/lib/prisma";

export type ProfileActionState={message?:string;errors?:Partial<Record<"firstName"|"lastName"|"phone",string[]>>};

export async function updateOwnProfile(_state:ProfileActionState,formData:FormData):Promise<ProfileActionState>{
  const session=await auth();
  if(!session?.user?.id)return{message:"Сессия завершена. Войдите снова."};
  const parsed=accountProfileSchema.safeParse(Object.fromEntries(formData));
  if(!parsed.success)return{errors:parsed.error.flatten().fieldErrors,message:"Проверьте введённые данные."};
  try{await prisma.user.update({where:{id:session.user.id},data:{firstName:parsed.data.firstName,lastName:parsed.data.lastName,phone:parsed.data.phone?normalizeKazakhstanPhone(parsed.data.phone):null},select:{id:true}})}catch{return{message:"Не удалось сохранить профиль. Попробуйте ещё раз."}}
  revalidatePath("/account");
  revalidatePath("/checkout");
  return{message:"Профиль сохранён."};
}
