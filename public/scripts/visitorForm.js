document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("camera");
    const captureBtn = document.getElementById("captureBtn");
    const capturedImage = document.getElementById("capturedImage");
    const photoInput = document.getElementById("photo");
    let stream = null; // Store the camera stream

    // Start Camera
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
        } catch (error) {
            console.error("❌ Camera access denied:", error);
        }
    }

    startCamera(); // Start camera on page load

    // Capture Photo
    captureBtn.addEventListener("click", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to Base64
        const imageData = canvas.toDataURL("image/jpeg");
        photoInput.value = imageData;

        // Stop Camera
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }

        // Hide video, show captured image
        video.style.display = "none";
        captureBtn.style.display = "none";
        capturedImage.src = imageData;
        capturedImage.style.display = "block";
    });

    // Form Submission
    document.getElementById("visitorForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = {
            fullName: document.getElementById("fullName").value,
            contactInfo: document.getElementById("contactInfo").value,
            purpose: document.getElementById("purpose").value,
            hostName: document.getElementById("hostName").value,
            hostDepartment: document.getElementById("hostDepartment").value,
            company: document.getElementById("company").value || "Individual",
            checkInTime: document.getElementById("checkInTime").value, // ✅ Get manual check-in time
            checkOutTime: document.getElementById("checkOutTime").value, // ✅ Get manual check-out time
            photo: document.getElementById("photo").value, // Base64 Image
        };

        try {
            const response = await fetch("/security/visitor-entry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            document.getElementById("message").innerText = result.message;

            if (response.ok) {
                // ✅ Clear form fields after successful submission
                document.getElementById("visitorForm").reset();

                // ✅ Reset camera for new entry
                capturedImage.style.display = "none"; // Hide captured image
                video.style.display = "block"; // Show video feed
                captureBtn.style.display = "block"; // Show capture button
                startCamera(); // Restart camera
            }

        } catch (error) {
            console.error("❌ Error:", error);
            document.getElementById("message").innerText = "Registration failed!";
        }
    });
});
