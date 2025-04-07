"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
// const axios = require('axios');
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
    name: string
    city: string
    region: string
    tenantId: number
    deviceId: string
    store_id: string
    token: string
}

export default function StoreForm() {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        city: "",
        region: "",
        tenantId: 0,
        deviceId: "",
        store_id: "",
        token: "",
    })

    // const baseUrl = "http://localhost:3000/v1"
    const baseUrl = "https://api.storefox.ai/v1"

    const [idForMapping, setIdForMapping] = useState<string>("")
    const [tokenForMapping, setTokenForMapping] = useState<string>("")
    const [mappingMessage, setMappingMessage] = useState<string>("")
    const [confirmationMessage, setConfirmationMessage] = useState<string>("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === "tenantId" ? Number.parseInt(value) || 0 : value,
        }))
    }

    async function getStoreCount(tenantId: number, token: string) {
        try {
            const response = await axios.get(`${baseUrl}/getAllStoresByTenantId?tenantId=${tenantId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const success = response.data.success;
            const count = response.data.data.stores.length || -1;
            console.log("count during api call", count);

            toast.success("Store count fetched successfully!");

            return { success, count: count + 1 };
        } catch (error) {
            console.error("Error fetching store count:", error);
            toast.error("Error fetching store count.");
            return { success: false, count: -1 };
        }
    }

    async function createStore(formData: FormData) {
        const data = {
            "name": formData.name,
            "city": formData.city,
            "region": formData.region,
            "store_id": formData.store_id,
            "tenantId": formData.tenantId,
            "deviceId": formData.deviceId
        };
        try {
            const response = await axios.post(`${baseUrl}/createStore`, data, {
                headers: { "Authorization": `Bearer ${formData.token}` }
            });

            console.log(response);

            const success = response.data.success;

            if (success) {
                toast.success(`Store created successfully with ID: ${response.data.store.insertedId}`);
            } else {
                toast.error("An error occurred while creating the store.");
            }

            return success;
        } catch (error) {
            console.error("Error creating store:", error);
            toast.error("An error occurred while creating the store.");
            return false;
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const tenantId = formData.tenantId
        const token = formData.token
        const { success, count } = await getStoreCount(tenantId, token)

        console.log("storeCount", count)

        formData.store_id = count.toString()

        console.log(formData)

        if (success) {
            let result = await createStore(formData)

            if (result) {
                console.log("Store created successfully")
                setConfirmationMessage("Store created successfully")
            }
        }
    }

    const handleReset = () => {
        setFormData({
            name: "",
            city: "",
            region: "",
            tenantId: 0,
            deviceId: "",
            store_id: "",
            token: "",
        })
    }

    async function handleMapping() {
        console.log("idFromMapping", idForMapping)

        let url;
        if (idForMapping === "") {
            url = `${baseUrl}/conversations/updateDeviceInfo`
        } else {
            url = `${baseUrl}/conversations/updateDeviceInfo?deviceId=${idForMapping}`
        }

        try {
            const response = await axios.post(url, {}, {
                headers: { "Authorization": `Bearer ${tokenForMapping}` }
            })

            console.log("response", response)

            if (response.data.success === "ok") {
                const message = response.data.data;
                setMappingMessage(message);
                toast.success("Device mapping updated successfully!", message); // Success toast
            } else {
                setMappingMessage("An error occurred while updating devices.");
                toast.error("An error occurred while updating devices."); // Error toast
            }
        } catch (error) {
            console.error("Error during device mapping:", error);
            toast.error("Error during device mapping."); // Error toast
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Store Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                            City
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="region" className="block text-sm font-medium text-gray-300 mb-1">
                            Region (Optional)
                        </label>
                        <input
                            type="text"
                            id="region"
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-1">
                            Token
                        </label>
                        <input
                            type="text"
                            id="token"
                            name="token"
                            value={formData.token}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="tenantId" className="block text-sm font-medium text-gray-300 mb-1">
                            Tenant ID
                        </label>
                        <input
                            type="number"
                            id="tenantId"
                            name="tenantId"
                            value={formData.tenantId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="deviceId" className="block text-sm font-medium text-gray-300 mb-1">
                            Device ID
                        </label>
                        <input
                            type="text"
                            id="deviceId"
                            name="deviceId"
                            value={formData.deviceId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        Clear
                    </button>
                </div>

                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="tokenForMapping" className="block text-sm font-medium text-gray-300 mb-1">
                            Token for Mapping
                        </label>
                        <input
                            type="text"
                            id="tokenForMapping"
                            name="tokenForMapping"
                            value={tokenForMapping}
                            onChange={(e) => setTokenForMapping(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setTokenForMapping("")}
                            className="mt-2 px-3 py-1 text-xs font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Clear Input
                        </button>
                    </div>
                    <div>
                        <label htmlFor="deviceIdAgain" className="block text-sm font-medium text-gray-300 mb-1">
                            Device ID for Mapping
                        </label>
                        <input
                            type="text"
                            id="deviceIdAgain"
                            name="deviceIdAgain"
                            value={idForMapping}
                            onChange={(e) => setIdForMapping(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setIdForMapping("")}
                            className="mt-2 px-3 py-1 text-xs font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Clear Input
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleMapping}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        Run Mapping
                    </button>
                </div>

                {/* Display the mapping message */}
                {mappingMessage && (
                    <div className="mt-4 text-sm text-gray-300">
                        {mappingMessage}
                    </div>
                )}

                {/* Display the confirmation message */}
                {confirmationMessage && (
                    <div className="mt-4 text-sm text-gray-300">
                        {confirmationMessage}
                    </div>
                )}
            </form>
            <button onClick={() => toast.info("This is a test notification!")}>
                Test Toast
            </button>
            <ToastContainer />
        </>
    )
}

