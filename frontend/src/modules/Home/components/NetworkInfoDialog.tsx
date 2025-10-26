import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Network } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PrimaryButton from '@/components/global/components/buttons/PrimaryButton';
import { DialogHeaderComponent } from '@/components/global/components/DialogHeader';

interface NetworkInfo {
	local_ip: string;
	api_url: string;
}

export const NetworkInfoDialog = () => {
	const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [open, setOpen] = useState(false);

	const fetchNetworkInfo = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				'http://localhost:5000/api/network/local-ip'
			);
			if (!response.ok) {
				throw new Error('Failed to fetch network info');
			}
			const data = await response.json();
			setNetworkInfo(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (newOpen && !networkInfo) {
			fetchNetworkInfo();
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant='outline'
					size='sm'>
					Network Info
				</Button>
			</DialogTrigger>
			<DialogContent
				className='sm:max-w-md p-0 gap-0'
				showCloseButton={false}>
				<DialogHeaderComponent
					icon={
						<Network
							strokeWidth={2}
							className='w-5 h-5 text-violet-600'
						/>
					}
					title='Network Information'
					description='Local network details for API access'
				/>

				<div>
					{loading && (
						<p className='text-sm text-gray-500'>Loading network info...</p>
					)}

					{error && (
						<div className='bg-red-50 border border-red-200 rounded p-3'>
							<p className='text-sm text-red-600'>Error: {error}</p>
						</div>
					)}

					{networkInfo && !loading && (
						<div className='space-y-2 flex flex-col items-center'>
							<div className='flex justify-center bg-white rounded-lg w-full'>
								<QRCodeSVG
									value={networkInfo.api_url}
									size={200}
									level='H'
									includeMargin={true}
									className='rounded'
								/>
							</div>

							<div className='text-sm font-mono text-gray-900 break-all max-w-sm text-center mb-8'>
								{networkInfo.api_url}
							</div>
						</div>
					)}
				</div>
				<DialogFooter>
					<div className='flex items-center justify-end w-full bg-gray-100 py-2 rounded-b-lg px-4'>
						<PrimaryButton
							onClick={() => setOpen(false)}
							className='px-5'>
							Close
						</PrimaryButton>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
