
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from "@/lib/prismadb";
import bcrypt from "bcrypt"

export const authoptions={
    providers: [
      CredentialsProvider({
          name: 'Credentials',
          credentials: {
            username: { label: 'email', type: 'text', placeholder: '' },
            password: { label: 'password', type: 'password', placeholder: '' },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          async authorize(credentials: any) {
            if (!credentials) return null
            const { username, password } = credentials
              const user = await prisma.user.findFirst({
                where:{
                  email:username
                }
              })
            if (user && bcrypt.compareSync(password, user.password || "")) {
              return { id: user.id, email: user.email }
            } 
            if (!user) {
              const hashedPassword = bcrypt.hashSync(password, 10);
              const user=  await prisma.user.create({
                data: {
                  email: username, 
                  password: hashedPassword 
                }
              }) 
              const uname = user.email.split("@")[0]
              return { id: user.id, email: user.email , name: uname };
            }
            throw new Error('Invalid credentials')
          },
        }),


        GoogleProvider({
          clientId: process.env.GOOGLE_ID || "",
          clientSecret: process.env.GOOGLE_SECRET || "",
          async profile(profile){
            const user = await prisma.user.upsert({  
              where: { email: profile.email },  
              update: {}, 
              create: {    
                email: profile.email || "",
                
              }  
            });  
    
            return {  
              id: user.id,  
              name: profile.name,  
              email: user.email,  
            }
          }
        },
        
      ),
        GithubProvider({
          clientId: process.env.GITHUB_ID || "",
          clientSecret: process.env.GITHUB_SECRET || "",
          async profile(profile){
            const user = await prisma.user.upsert({  
              where: { email: profile.email || ""},  
              update: {}, 
              create: {    
                email: profile.email || "", 
              }  
            });  
    
            return {  
              id: user.id,  
              name: profile.name,  
              email: user.email,  
            }
          }
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jwt: async ({ user, token }: any) => {
      if (user) {
          token.uid = user.id;
      }
      return token;
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session: ({ session, token }: any) => {
        if (session.user) {
            session.user.id = token.uid
        }
        return session
    }
  },
  }