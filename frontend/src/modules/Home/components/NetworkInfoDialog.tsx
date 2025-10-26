import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PrimaryButton from '@/components/global/components/buttons/PrimaryButton';

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
			<DialogContent className='sm:max-w-md p-0'>
				<DialogHeader className='p-4'>
					<DialogTitle>Network Information</DialogTitle>
					<DialogDescription>
						Local network details for API access
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 px-4'>
					{loading && (
						<p className='text-sm text-gray-500'>Loading network info...</p>
					)}

					{error && (
						<div className='bg-red-50 border border-red-200 rounded p-3'>
							<p className='text-sm text-red-600'>Error: {error}</p>
						</div>
					)}

					{networkInfo && !loading && (
						<div className='space-y-3'>
							<div className='bg-gray-50 rounded-lg p-4 space-y-2'>
								<div className='text-xs font-semibold text-gray-600 uppercase'>
									Local IP Address
								</div>
								<div className='text-lg font-mono font-bold text-gray-900'>
									{networkInfo.local_ip}
								</div>
							</div>

							<div className='bg-blue-50 rounded-lg p-4 space-y-2'>
								<div className='text-xs font-semibold text-gray-600 uppercase'>
									API URL
								</div>
								<div className='text-sm font-mono text-blue-900 break-all'>
									{networkInfo.api_url}
								</div>
							</div>

							<div className='flex justify-center bg-white rounded-lg p-4 border border-gray-200'>
								<QRCodeSVG
									value={networkInfo.api_url}
									size={200}
									level='H'
									includeMargin={true}
									className='rounded'
								/>
							</div>

							<Button
								onClick={() => {
									navigator.clipboard.writeText(networkInfo.api_url);
								}}
								variant='secondary'
								className='w-full'>
								Copy API URL
							</Button>
						</div>
					)}
				</div>
				<DialogFooter>
					<div className='flex items-center justify-end w-full bg-gray-100 py-2 rounded-b-lg px-4'>
						<PrimaryButton
							onClick={() => setOpen(false)}
              className='px-5'
              >
							Close
						</PrimaryButton>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
