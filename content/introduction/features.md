---
title: "Features"
date: 2018-07-16T14:28:16-07:00
draft: false
weight: 2
---

#### Low latency
OpenCensus is simple to integrate and use, it adds very low latency to your applications and it is already integrated into both gRPC and HTTP transports.

#### Vendor Agnostic
OpenCensus is vendor-agnostic and can upload data to any backend with various exporter implementations. Even though, OpenCensus provides support for many backends, users can also implement their own exporters for proprietary and unofficially supported backends. [Read more](/introduction/core-concepts/exporters/).

#### Simplified tracing
Distributed traces track the progression of a single user request as it is handled by the internal services until the user request is responded. [Read more](/introduction/core-concepts/exporters/traces/).

#### Context Propagation
Context propagation is the mechanism by which information (of your choosing) is sent between your services. It is usually performed by sending data in HTTP headers and trailers.

Typical information sent during context propagation includes:

* Latency
* CPU usage
* Payload size
* Open file descriptors
* And more! It is up to you.
