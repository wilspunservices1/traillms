"use client";

import React, { useEffect, useState } from "react";
import { BASE_URL } from "@/actions/constant";

const ProgressBar = ({ courseId , refreshTrigger}) => {
	const [totalScore, setTotalScore] = useState(0);
	const [maxScore, setMaxScore] = useState(0);
	const [progressRefresh, setProgressRefresh] = useState(0);
	useEffect(() => {
		const fetchProgress = async () => {
			try {
				const res = await fetch(`${BASE_URL}/api/progress/${courseId}`);
				if (!res.ok) throw new Error("Failed to fetch progress");
				const data = await res.json();

				// setProgress(Number(data.progress) || 0);
				setTotalScore(Number(data.totalScore) || 0);
				setMaxScore(Number(data.maxScore) || 0);
				// setProgressRefresh(progressRefresh + 1);
			} catch (error) {
				console.error("Error fetching progress:", error);
				setTotalScore(0);
				setMaxScore(0);
			}
		};

		fetchProgress();
	}, [courseId, refreshTrigger]);

	const percentage =
		maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

	return (
		<div
			style={{
				padding: "10px 20px",
				background: "#f0f0f0",
				borderRadius: "8px",
			}}
		>
			<div
				style={{
					position: "relative",
					height: "10px",
					background: "#ddd",
					borderRadius: "5px",
				}}
			>
				{/* Progress Bar Fill */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						height: "10px",
						width: `${percentage}%`,
						background: "#5F2DED",
						borderRadius: "5px",
						transition: "width 0.3s ease",
					}}
				/>
				{/* Circular Percentage Indicator */}
				<div
					style={{
						position: "absolute",
						top: "-15px",
						right: `${Math.max(percentage - 5, 0)}%`, // Adjust for better positioning
						width: "40px",
						height: "40px",
						background: "#5F2DED",
						borderRadius: "50%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#fff",
						fontWeight: "bold",
						fontSize: "14px",
					}}
				>
					{percentage}%
				</div>
			</div>

			<p
				style={{
					textAlign: "center",
					fontSize: "14px",
					marginTop: "5px",
					fontWeight: "bold",
				}}
			>
				Score: {totalScore} / {maxScore}
			</p>
		</div>
	);
};

export default ProgressBar;
