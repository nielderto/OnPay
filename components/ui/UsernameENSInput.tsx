"use client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEnsAddress} from "wagmi"
import {liskSepolia} from "viem/chains"
import {useState} from "react"  

export default function UsernameENSInput() {
    const formSchema = z.object({
        username: z.string().min(3, {message: "ENS name is too short"}),
    })
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    })
    
}