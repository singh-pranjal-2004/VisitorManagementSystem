document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("camera");
    const captureBtn = document.getElementById("captureBtn");
    const capturedImage = document.getElementById("capturedImage");
    const photoInput = document.getElementById("photo");
    let stream = null;

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
        } catch (error) {
            console.error("❌ Camera access denied:", error);
        }
    }

    startCamera(); 

    captureBtn.addEventListener("click", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/jpeg");
        photoInput.value = imageData;

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }

        video.style.display = "none";
        captureBtn.style.display = "none";
        capturedImage.src = imageData;
        capturedImage.style.display = "block";
    });

    document.getElementById("visitorForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = {
            fullName: document.getElementById("fullName").value,
            contactInfo: document.getElementById("contactInfo").value,
            purpose: document.getElementById("purpose").value,
            hostName: document.getElementById("hostName").value,
            hostDepartment: document.getElementById("hostDepartment").value,
            company: document.getElementById("company").value || "Individual",
            checkInTime: document.getElementById("checkInTime").value, 
            checkOutTime: document.getElementById("checkOutTime").value, 
            photo: document.getElementById("photo").value, 
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
                document.getElementById("visitorForm").reset();

                capturedImage.style.display = "none"; 
                video.style.display = "block"; 
                captureBtn.style.display = "block"; 
                startCamera(); 
            }

        } catch (error) {
            console.error("❌ Error:", error);
            document.getElementById("message").innerText = "Registration failed!";
        }
    });
});
