import SimulationDetailView from "../../../components/SimulationDetailView";

export default async function SimulationDetail({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <SimulationDetailView id={id} />;
}