
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import MindMap from './MindMap';
import InsightPanel from './InsightPanel';
import FileCompare from './FileCompare';
import { FileData } from '../types/files';
import { useFiles } from '../context/FileContext';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Database, File, Network, Layers } from "lucide-react";
import { Button } from '@/components/ui/button';
