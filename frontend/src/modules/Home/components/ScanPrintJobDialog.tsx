import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import PrimaryButton from '@/components/global/components/buttons/PrimaryButton';
import { DialogHeaderComponent } from '@/components/global/components/DialogHeader';
import { useGetPrintJobQREndPoint } from '@/modules/Home/hooks';

export const ScanPrintJobDialog = () => {
	const [open, setOpen] = useState(false);
	const { networkInfo, loading, error, actions } = useGetPrintJobQREndPoint();

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (newOpen && !networkInfo) {
			actions.refetch();
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<div className='flex flex-col gap-1'>
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<PrimaryButton
									onClick={() => {}}
									className='gap-2'>
									<QrCode className='w-4 h-4' />
									<span>Create Print Job</span>
								</PrimaryButton>
							</div>
						</TooltipTrigger>
						<TooltipContent className='bg-gray-900 text-white border-0 max-w-xs'>
							<p className='text-xs'>Click to show the dialog containing the QR code for printing waybills on your mobile device</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</DialogTrigger>
			<DialogContent
				className='sm:max-w-md p-0 gap-0'
				showCloseButton={false}>
				<DialogHeaderComponent
					icon={
						<QrCode
							strokeWidth={2}
							className='w-5 h-5 text-violet-600'
						/>
					}
					title='Scan to Create Print Job'
					description='Scan this QR code with your mobile device to submit print jobs'
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
									value={`${networkInfo.api_url}/api/waybills/prints`}
									size={200}
									level='H'
									includeMargin={true}
									className='rounded'
								/>
							</div>

							<div className='text-sm font-mono text-gray-900 break-all max-w-sm text-center mb-8'>
								{`${networkInfo.api_url}/api/waybills/prints`}
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
