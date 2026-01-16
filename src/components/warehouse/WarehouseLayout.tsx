import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, Boxes, BarChart3, Home, Scissors } from "lucide-react";
import InboundForm from "./InboundForm";
import FulfillmentManager from "./FulfillmentManager";
import InventoryKardex from "./InventoryKardex";
import WarehouseKPIs from "./WarehouseKPIs";
import WarehouseManager from "./WarehouseManager";
import FractioningTool from "./FractioningTool";

export default function WarehouseLayout() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-purple-900 flex items-center gap-2">
                <Boxes className="h-8 w-8" /> Control de Almacén Central
            </h1>

            <WarehouseKPIs />

            <Tabs defaultValue="fulfillment" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-5 bg-purple-50">
                    <TabsTrigger value="fulfillment" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                        <Truck className="mr-2 h-4 w-4" /> Despacho
                    </TabsTrigger>
                    <TabsTrigger value="inbound" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                        <Package className="mr-2 h-4 w-4" /> Recepción
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <BarChart3 className="mr-2 h-4 w-4" /> Kardex
                    </TabsTrigger>
                    <TabsTrigger value="operations" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                        <Scissors className="mr-2 h-4 w-4" /> Operaciones
                    </TabsTrigger>
                    <TabsTrigger value="locations" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                        <Home className="mr-2 h-4 w-4" /> Ubicaciones
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="fulfillment">
                    <Card>
                        <CardContent className="pt-6">
                            <FulfillmentManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inbound">
                    <Card>
                        <CardContent className="pt-6">
                            <InboundForm />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory">
                    <Card>
                        <CardContent className="pt-6">
                            <InventoryKardex />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="operations">
                    <Card>
                        <CardContent className="pt-6">
                            <FractioningTool />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="locations">
                    <Card>
                        <CardContent className="pt-6">
                            <WarehouseManager />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
