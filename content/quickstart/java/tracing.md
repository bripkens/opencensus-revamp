---
title: "Tracing"
date: 2018-07-16T14:29:21-07:00
draft: false
---

{{% notice note %}}
This guide makes use of Stackdriver for visualizing your data. For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

#### Table of contents

- [Requirements](#background)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Enable Tracing](#enable-tracing)
    - [Import Packages](#import-tracing-packages)
    - [Instrumentation](#instrument-tracing)
- [Exporting to Stackdriver](#exporting-to-stackdriver)
    - [Import Packages](#import-exporting-packages)
    - [Export Traces](#export-traces)
    - [Create Annotations](#create-annotations)
- [Viewing your Traces on Stackdriver](#viewing-your-traces-on-stackdriver)

In this quickstart, we’ll learn gleam insights into a segment of code and learn how to:

1. Trace the code using [OpenCensus Tracing](/core-concepts/tracing)
2. Register and enable an exporter for a [backend](http://localhost:1313/core-concepts/exporters/#supported-backends) of our choice
3. View traces on the backend of our choice

#### Requirements
- Java 8+
- Google Cloud Platform account anproject
- Google Stackdriver Tracing enabled on your project (Need help? [Click here](/codelabs/stackdriver))

#### Installation
```bash
mvn archetype:generate \
  -DgroupId=io.opencensus.quickstart \
  -DartifactId=repl-app \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DinteractiveMode=false \

cd repl-app/src/main/java/io/opencensus/quickstart

mv App.Java Repl.java
```
Put this in your newly generated `pom.xml` file:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus.quickstart</groupId>
    <artifactId>quickstart</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>quickstart</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.14.0</opencensus.version> <!-- The OpenCensus version to use -->
    </properties>

    <build>
        <extensions>
            <extension>
                <groupId>kr.motd.maven</groupId>
                <artifactId>os-maven-plugin</artifactId>
                <version>1.5.0.Final</version>
            </extension>
        </extensions>

        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.7.0</version>
                    <configuration>
                        <source>1.8</source>
                        <target>1.8</target>
                    </configuration>
                </plugin>

                <plugin>
                    <groupId>org.codehaus.mojo</groupId>
                    <artifactId>appassembler-maven-plugin</artifactId>
                    <version>1.10</version>
                    <configuration>
                        <programs>
                            <program>
                                <id>Repl</id>
                                <mainClass>io.opencensus.quickstart.Repl</mainClass>
                            </program>
                        </programs>
                    </configuration>
                </plugin>
            </plugins>

        </pluginManagement>

    </build>
</project>
```

Put this in `/src/main/java/io/opencensus/quickstart/Repl.java`:

{{<highlight java>}}
package io.opencensus.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

public class Repl {
    public static void main(String ...args) {
        // Step 1. Enable OpenCensus Tracing.
        try {
            setupOpenCensusAndStackdriverExporter();
        } catch (IOException e) {
            System.err.println("Failed to create and register OpenCensus Stackdriver Trace exporter "+ e);
            return;
        }

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcess(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        return line.toUpperCase();
    }

    private static String readLine(BufferedReader in) {
        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            System.err.println("Failde to read line "+ e);
        } finally {
            return line;
        }
    }

    private static void readEvaluateProcess(BufferedReader in) throws IOException {
        System.out.print("> ");
        System.out.flush();
        String line = readLine(in);
        String processed = processLine(line);
        System.out.println("< " + processed + "\n");
    }

    private static void setupOpenCensusAndStackdriverExporter() throws IOException {
        // to do
    }

    // Used for retrieving Google Cloud Project ID
    private static String envOrAlternative(String key, String ...alternatives) {
        String value = System.getenv().get(key);
        if (value != null && value != "")
            return value;

        // Otherwise now look for the alternatives.
        for (String alternative : alternatives) {
            if (alternative != null && alternative != "") {
                value = alternative;
                break;
            }
        }

        return value;
    }
}
{{</highlight>}}

Install required dependencies:
```bash
mvn install
```

#### Getting Started
We have just done a lot of copy-pasting. It is time to take a deep breath, go over what we currently have, and feel comfortable before moving on.

Let's first run the application and see what we have.
```bash
mvn exec:java -Dexec.mainClass=io.opencensus.quickstart.Repl
```
That's right! We have ourselves a lower-to-UPPERCASE REPL. You should see something like this:
![java image 1](https://cdn-images-1.medium.com/max/1600/1*VFN-txsDL6qYkN_UH3VwhA.png)

Now, let's go over the code in `Repl.java` and become familiar with our starting point.

**1. main()**

First, we are calling a function called `setupOpenCensusAndStackdriverExporter`. That function currently does nothing, and we will populate it later.
```java
try {
    setupOpenCensusAndStackdriverExporter();
} catch (IOException e) {
    System.err.println("Failed to create and register OpenCensus Stackdriver Trace exporter "+ e);
    return;
}
```

Then we instantiate a normal REPL:
```java
// Step 2. The normal REPL.
BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));
```

Then we call our method `readEvaluateProcess` that will do the heavy lifting:
```java
while (true) {
    try {
        readEvaluateProcess(stdin);
    } catch (IOException e) {
        System.err.println("Exception "+ e);
    }
}
```

**2. readEvaluateProcess()**

Finally, we get a string with `readLine`, and then transform the string to uppercase with `processLine`.
```java
private static void readEvaluateProcess(BufferedReader in) throws IOException {
    System.out.print("> ");
    System.out.flush();
    String line = readLine(in);
    String processed = processLine(line);
    System.out.println("< " + processed + "\n");
}
```

Presto, we're done! We are ready to enable tracing.

#### Enable Tracing

##### Import Packages
To enable tracing, we’ll declare the dependencies in your `pom.xml` file:

{{<tabs Snippet All>}}
{{<highlight xml>}}
<dependencies>
    <dependency>
        <groupId>io.opencensus</groupId>
        <artifactId>opencensus-api</artifactId>
        <version>${opencensus.version}</version>
    </dependency>

    <dependency>
        <groupId>io.opencensus</groupId>
        <artifactId>opencensus-impl</artifactId>
        <version>${opencensus.version}</version>
    </dependency>

    <dependency>
        <groupId>io.opencensus</groupId>
        <artifactId>opencensus-exporter-trace-stackdriver</artifactId>
        <version>${opencensus.version}</version>
    </dependency>
</dependencies>
{{</highlight>}}

{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus.quickstart</groupId>
    <artifactId>quickstart</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>quickstart</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.14.0</opencensus.version> <!-- The OpenCensus version to use -->
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-api</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-impl</artifactId>
            <version>${opencensus.version}</version>
        </dependency>
    </dependencies>

    <build>
        <extensions>
            <extension>
                <groupId>kr.motd.maven</groupId>
                <artifactId>os-maven-plugin</artifactId>
                <version>1.5.0.Final</version>
            </extension>
        </extensions>

        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.7.0</version>
                    <configuration>
                        <source>1.8</source>
                        <target>1.8</target>
                    </configuration>
                </plugin>

                <plugin>
                    <groupId>org.codehaus.mojo</groupId>
                    <artifactId>appassembler-maven-plugin</artifactId>
                    <version>1.10</version>
                    <configuration>
                        <programs>
                            <program>
                                <id>Repl</id>
                                <mainClass>io.opencensus.quickstart.Repl</mainClass>
                            </program>
                        </programs>
                    </configuration>
                </plugin>
            </plugins>

        </pluginManagement>

    </build>
</project>
{{</highlight>}}
{{</tabs>}}

Now add the import statements to your `Repl.java`:

```java
import io.opencensus.common.Scope;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
```


##### Instrumentation
We will begin by creating a private static `Tracer` as a property of our Repl class.

```java
private static final Tracer TRACER = Tracing.getTracer();
```

We will be tracing the execution as it flows through `readEvaluateProcess`, `readLine`, and finally `processLine`.

You can create a span by inserting the following line in each of the three functions:
```java
Scope ss = TRACER.spanBuilder("repl").startScopedSpan();
```

Here is updated state of `Repl.java`:

```java
package io.opencensus.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import io.opencensus.common.Scope;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;

public class Repl {
    private static final Tracer TRACER = Tracing.getTracer();

    public static void main(String ...args) {
        // Step 1. Enable OpenCensus Tracing.
        try {
            setupOpenCensusAndStackdriverExporter();
        } catch (IOException e) {
            System.err.println("Failed to create and register OpenCensus Stackdriver Trace exporter "+ e);
            return;
        }

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcess(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = TRACER.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = TRACER.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = TRACER.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }

    private static void readEvaluateProcess(BufferedReader in) throws IOException {
        try (Scope ss = TRACER.spanBuilder("repl").startScopedSpan()) {
            System.out.print("> ");
            System.out.flush();
            String line = readLine(in);
            String processed = processLine(line);
            System.out.println("< " + processed + "\n");
        }
    }

    private static void setupOpenCensusAndStackdriverExporter() throws IOException {
        // to do
    }

    // Used for retrieving Google Cloud Project ID
    private static String envOrAlternative(String key, String ...alternatives) {
        String value = System.getenv().get(key);
        if (value != null && value != "")
            return value;

        // Otherwise now look for the alternatives.
        for (String alternative : alternatives) {
            if (alternative != null && alternative != "") {
                value = alternative;
                break;
            }
        }

        return value;
    }
}
```

#### Exporting to Stackdriver

##### Import Packages
To turn on Stackdriver Tracing, we’ll need to declare the Stackdriver dependency in your `pom.xml`:

{{<tabs Snippet All>}}
{{<highlight xml>}}
<dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-exporter-trace-stackdriver</artifactId>
    <version>${opencensus.version}</version>
</dependency>
{{</highlight>}}

{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus.quickstart</groupId>
    <artifactId>quickstart</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>quickstart</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.14.0</opencensus.version> <!-- The OpenCensus version to use -->
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-api</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-impl</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-trace-stackdriver</artifactId>
            <version>${opencensus.version}</version>
        </dependency>
    </dependencies>

    <build>
        <extensions>
            <extension>
                <groupId>kr.motd.maven</groupId>
                <artifactId>os-maven-plugin</artifactId>
                <version>1.5.0.Final</version>
            </extension>
        </extensions>

        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.7.0</version>
                    <configuration>
                        <source>1.8</source>
                        <target>1.8</target>
                    </configuration>
                </plugin>

                <plugin>
                    <groupId>org.codehaus.mojo</groupId>
                    <artifactId>appassembler-maven-plugin</artifactId>
                    <version>1.10</version>
                    <configuration>
                        <programs>
                            <program>
                                <id>Repl</id>
                                <mainClass>io.opencensus.quickstart.Repl</mainClass>
                            </program>
                        </programs>
                    </configuration>
                </plugin>
            </plugins>

        </pluginManagement>

    </build>
</project>
{{</highlight>}}
{{</tabs>}}

Now add the import statements to your `Repl.java`:
```java
import java.util.HashMap;
import java.util.Map;

import io.opencensus.trace.AttributeValue;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;

import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;
```

##### Export Traces

Let's first setup our `setupOpenCensusAndStackdriverExporter` function:

```java
private static void setupOpenCensusAndStackdriverExporter() throws IOException {
    TraceConfig traceConfig = Tracing.getTraceConfig();
    // For demo purposes, lets always sample.
    traceConfig.updateActiveTraceParams(
            traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

    String gcpProjectId = envOrAlternative("GCP_PROJECT_ID");

    StackdriverTraceExporter.createAndRegister(
            StackdriverTraceConfiguration.builder()
            .setProjectId(gcpProjectId)
            .build());
}
```

##### Create Annotations
When looking at our traces on a backend (such as Stackdriver), we can add metadata to our traces to increase our post-mortem insight.

Let's record the length of each requested string so that it is available to view when we are looking at our traces.

To do this, we'll dive in to `readEvaluateProcess`.

Between `String line = readLine(in)` and `String processed = processLine(line)`, add this:

```java
// Annotate the span to indicate we are invoking processLine next.
Map<String, AttributeValue> attributes = new HashMap<String, AttributeValue>();
attributes.put("len", AttributeValue.longAttributeValue(line.length()));
attributes.put("use", AttributeValue.stringAttributeValue("repl"));
Span span = TRACER.getCurrentSpan();
span.addAnnotation("Invoking processLine", attributes);
```

The final state of `Repl.java` should be this:

```java
ackage io.opencensus.quickstart;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import io.opencensus.common.Scope;
import io.opencensus.trace.AttributeValue;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;

import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;

public class Repl {
    private static final Tracer TRACER = Tracing.getTracer();

    public static void main(String ...args) {
        // Step 1. Enable OpenCensus Tracing.
        try {
            setupOpenCensusAndStackdriverExporter();
        } catch (IOException e) {
            System.err.println("Failed to create and register OpenCensus Stackdriver Trace exporter "+ e);
            return;
        }

        // Step 2. The normal REPL.
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                readEvaluateProcess(stdin);
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static String processLine(String line) {
        try (Scope ss = TRACER.spanBuilder("processLine").startScopedSpan()) {
            return line.toUpperCase();
        }
    }

    private static String readLine(BufferedReader in) {
        Scope ss = TRACER.spanBuilder("readLine").startScopedSpan();

        String line = "";

        try {
            line = in.readLine();
        } catch (Exception e) {
            Span span = TRACER.getCurrentSpan();
            span.setStatus(Status.INTERNAL.withDescription(e.toString()));
        } finally {
            ss.close();
            return line;
        }
    }

    private static void readEvaluateProcess(BufferedReader in) throws IOException {
        try (Scope ss = TRACER.spanBuilder("repl").startScopedSpan()) {
            System.out.print("> ");
            System.out.flush();
            String line = readLine(in);

            // Annotate the span to indicate we are invoking processLine next.
            Map<String, AttributeValue> attributes = new HashMap<String, AttributeValue>();
            attributes.put("len", AttributeValue.longAttributeValue(line.length()));
            attributes.put("use", AttributeValue.stringAttributeValue("repl"));
            Span span = TRACER.getCurrentSpan();
            span.addAnnotation("Invoking processLine", attributes);

            String processed = processLine(line);
            System.out.println("< " + processed + "\n");
        }
    }

    private static void setupOpenCensusAndStackdriverExporter() throws IOException {
        TraceConfig traceConfig = Tracing.getTraceConfig();
        // For demo purposes, lets always sample.
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

        String gcpProjectId = envOrAlternative("GCP_PROJECT_ID");

        StackdriverTraceExporter.createAndRegister(
                StackdriverTraceConfiguration.builder()
                .setProjectId(gcpProjectId)
                .build());
    }

    private static String envOrAlternative(String key, String ...alternatives) {
        String value = System.getenv().get(key);
        if (value != null && value != "")
            return value;

        // Otherwise now look for the alternatives.
        for (String alternative : alternatives) {
            if (alternative != null && alternative != "") {
                value = alternative;
                break;
            }
        }

        return value;
    }
}
```

#### Viewing your Traces on Stackdriver
With the above you should now be able to navigate to the [Google Cloud Platform console](https://console.cloud.google.com/traces/traces), select your project, and view the traces.

![viewing traces 1](https://cdn-images-1.medium.com/max/1600/1*v7qiO8nX8WAxpX4LjiQ2oA.png)

And on clicking on one of the traces, we should be able to see the annotation whose description `isInvoking processLine` and on clicking on it, it should show our attributes `len` and `use`.

![viewing traces 2](https://cdn-images-1.medium.com/max/1600/1*SEsUxV1GXu-jM8dLQwtVMw.png)
